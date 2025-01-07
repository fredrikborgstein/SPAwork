import Framework from './Framework.js';
import Router from './Router.js';
import Store from './Store.js';
import { h } from './vdom.js';

const store = new Store({ user: null, theme: 'light' });
store.subscribe((state) => console.log('[Store] State updated:', state));

const app = new Framework('app', { store }, true); // Debug enabled

const isAuthenticated = (params) => {
    if (!store.getState().user) {
        alert('You must log in first!');
        router.navigate('/login');
        return false;
    }
    return true;
};

const HomeView = {
    render: () =>
        h('div', {},
            h('h1', {}, 'Home Page'),
            h('button', { id: 'goToAbout' }, 'Go to About'),
            h('button', { id: 'loginUser' }, 'Log In')
        ),
    onMount: () => {
        const goToAboutButton = document.getElementById('goToAbout');
        const loginUserButton = document.getElementById('loginUser');

        if (goToAboutButton) {
            goToAboutButton.addEventListener('click', () => router.navigate('/about'));
        }

        if (loginUserButton) {
            loginUserButton.addEventListener('click', () => {
                store.setState({ user: { name: 'John Doe' } });
                alert('User logged in!');
            });
        }
    },
};

export default function AboutPage() {
    return {
        render: () => `
            <div>
                <h1>About Us</h1>
                <p>Learn more about our journey.</p>
                <button id="contactUsButton">Contact Us</button>
            </div>
        `,
        onMount: () => {
            const button = document.getElementById('contactUsButton');
            if (button) {
                button.addEventListener('click', () => router.navigate('/contact'));
            }
        },
        onDismount: () => {
            const button = document.getElementById('contactUsButton');
            if (button) {
                button.removeEventListener('click', () => router.navigate('/contact'));
            }
        },
    };
}


const DashboardView = {
    render: () =>
        h('div', {},
            h('h1', {}, 'Dashboard'),
            h('p', {}, `Welcome, ${store.getState().user?.name || 'Guest'}!`),
            h('button', { id: 'logoutUser' }, 'Log Out')
        ),
    onMount: () => {
        const logoutUserButton = document.getElementById('logoutUser');
        if (logoutUserButton) {
            logoutUserButton.addEventListener('click', () => {
                store.setState({ user: null });
                router.navigate('/');
            });
        }
    },
};

const LazyView = {
    render: () =>
        h('div', {},
            h('h1', {}, 'Lazy Loaded View'),
            h('button', { id: 'goToHome' }, 'Go to Home')
        ),
    onMount: () => {
        const goToHomeButton = document.getElementById('goToHome');
        if (goToHomeButton) {
            goToHomeButton.addEventListener('click', () => router.navigate('/'));
        }
    },
};

const LoginView = {
    render: () =>
        h('div', {},
            h('h1', {}, 'Login Page'),
            h('p', {}, 'Please log in to access the dashboard.'),
            h('button', { id: 'loginUser' }, 'Log In')
        ),
    onMount: () => {
        const loginUserButton = document.getElementById('loginUser');
        if (loginUserButton) {
            loginUserButton.addEventListener('click', () => {
                store.setState({ user: { name: 'John Doe' } });
                alert('User logged in!');
                router.navigate('/dashboard');
            });
        }
    },
};

// Routes
const routes = {
    '/': { meta: { title: 'Home' }, view: HomeView },
    '/about': { meta: { title: 'About Us' }, view: AboutPage },
    '/dashboard': { meta: { title: 'Dashboard' }, middleware: [isAuthenticated], view: DashboardView },
    '/lazy': {
        meta: { title: 'Lazy Loaded View' },
        view: async () => LazyView,
    },
    '/login': { meta: { title: 'Login' }, view: LoginView },
    '/404': {
        meta: { title: 'Page Not Found' },
        view: {
            render: () => h('div', {}, h('h1', {}, '404 - Page Not Found')),
        },
    },
};

// Initialize Router with Debug Mode
const router = new Router(routes, app, true);

// Start the app by rendering the initial route
router.updateView();
