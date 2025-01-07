import { h, diff, createElement } from './vdom.js';

class Framework {
    constructor(rootId, dependencies = {}, debug = false) {
        this.root = document.getElementById(rootId);
        if (!this.root || this.root.nodeType !== 1) {
            throw new Error(`Invalid root element for id "${rootId}". Ensure it is an element, not a text node.`);
        }
        this.currentUnmount = null;
        this.dependencies = dependencies;
        this.debug = debug;
        this.currentVNode = null;
    }

    /**
     * Render a view with diffing and patching using the virtual DOM
     * @param {Function|Object|Promise} view - The view to render (function, component, or promise)
     */
    async render(view) {
        if (this.debug) console.time('Render Time');

        await this.fadeOut();

        if (this.currentUnmount) {
            if (this.debug) console.log('[Framework] Calling onDismount');
            this.currentUnmount();
            this.currentUnmount = null;
        }

        try {
            let resolvedView;
            if (typeof view === 'function') {
                resolvedView = view();
            } else if (typeof view === 'object' && typeof view.render === 'function') {
                resolvedView = view;
            } else {
                throw new Error('Invalid view type');
            }

            if (this.debug) console.log('[Framework] Resolved view:', resolvedView);

            this.root.innerHTML = '';
            const output = resolvedView.render(this.dependencies);

            if (typeof output === 'string') {
                if (this.debug) console.log('[Framework] Rendering HTML string');
                this.root.innerHTML = output;
                this.currentVNode = null;
            } else {
                if (this.debug) console.log('[Framework] Rendering virtual DOM');
                const patch = diff(this.currentVNode, output);
                patch(this.root);
                this.currentVNode = output;
            }

            if (resolvedView.onMount) {
                if (this.debug) console.log('[Framework] Calling onMount');
                setTimeout(() => resolvedView.onMount(this.dependencies), 0);
            }

            if (resolvedView.onDismount) {
                this.currentUnmount = resolvedView.onDismount;
            }

            await this.fadeIn();

            if (this.debug) console.timeEnd('Render Time');
        } catch (error) {
            this.displayError(error);
        }
    }

    /**
     * Perform fade-out animation
     * @returns {Promise} - Resolves after the fade-out animation completes
     */
    fadeOut() {
        return new Promise((resolve) => {
            this.root.style.transition = 'opacity 0.1s ease-out';
            this.root.style.opacity = '0';
            setTimeout(resolve, 100);
        });
    }

    /**
     * Perform fade-in animation
     * @returns {Promise} - Resolves after the fade-in animation completes
     */
    fadeIn() {
        return new Promise((resolve) => {
            this.root.style.transition = 'opacity 0.1s ease-in';
            this.root.style.opacity = '1';
            setTimeout(resolve, 100);
        });
    }

    /**
     * Display an error message in the root element
     * @param {Error} error - The error that occurred
     */
    displayError(error) {
        this.root.innerHTML = `
            <div class="error-boundary">
                <h1>An error occurred</h1>
                <p>${error.message}</p>
                <pre>${error.stack}</pre>
            </div>
        `;
    }

    /**
     * Clear the root element
     */
    clear() {
        if (this.currentUnmount) {
            this.currentUnmount();
            this.currentUnmount = null;
        }
        this.root.innerHTML = '';
        this.currentVNode = null;
    }

      renderComponent(Component, props = {}, dependencies = {}) {
        const instance = Component(props);

        if (instance.onMount) {
            setTimeout(() => instance.onMount(dependencies), 0);
        }

        if (instance.onDismount) {
            dependencies.currentUnmount = instance.onDismount;
        }

        return instance.render();
    }

}

export default Framework;
