class Router {
    constructor(routes, app, debug = false) {
        this.routes = routes;
        this.app = app;
        this.debug = debug;
        this.listen();
    }

    getRoute(path = window.location.pathname, routes = this.routes) {
        for (const route in routes) {
            const regex = new RegExp(`^${route.replace(/:\w+/g, "\\w+")}$`);
            if (regex.test(path)) {
                const routeObj = routes[route];
                const params = this.extractParams(route, path);

                if (routeObj.children) {
                    const childMatch = this.getRoute(path, routeObj.children);
                    if (childMatch) return childMatch;
                }

                return { route, params, routeObj };
            }
        }

        return { route: '/404', params: {}, routeObj: this.routes['/404'] };
    }

    extractParams(route, path) {
        const values = path.split('/');
        const keys = route.split('/');

        return keys.reduce((params, key, index) => {
            if (key.startsWith(':')) {
                params[key.slice(1)] = values[index];
            }
            return params;
        }, {});
    }

    listen() {
        window.addEventListener('popstate', () => this.updateView());
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.hasAttribute('data-link')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href'));
            }
        });
    }

    navigate(path) {
        window.history.pushState({}, "", path);
        this.updateView();
    }

    async updateView() {
        const { route, params, routeObj } = this.getRoute();

        if (!routeObj) {
            this.routes['/404'].view(params);
            return;
        }

        if (this.debug) {
            console.log('[Router] Navigating to:', route);
            console.log('[Router] Matched Route Object:', routeObj);
            console.log('[Router] Route Params:', params);
        }

        if (routeObj.meta) {
            document.title = routeObj.meta.title || document.title;
            const descriptionMeta = document.querySelector('meta[name="description"]');
            if (descriptionMeta && routeObj.meta.description) {
                descriptionMeta.setAttribute('content', routeObj.meta.description);
            }
        }

        const middlewares = routeObj.middleware || [];
        for (const middlewareFn of middlewares) {
            const result = middlewareFn(params);
            if (!result) return;
        }

        if (routeObj.preload) {
            try {
                await routeObj.preload(params);
            } catch (error) {
                throw new Error(error);
            }
        }

        if (typeof routeObj.view === 'function') {
            const resolvedView = await routeObj.view();
            this.app.render(resolvedView.default || resolvedView);
        } else if (routeObj.view && routeObj.view.render) {
            this.app.render(routeObj.view);
        } else {
            throw new Error(`Invalid view for route: ${route}`);
        }
    }

}

export default Router;
