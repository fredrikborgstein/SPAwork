# Framework Documentation

## Overview
This framework is a lightweight JavaScript framework for creating single-page applications (SPAs) with virtual DOM support, routing, state management, and component-based architecture. Views can now be defined using string-based HTML templates or virtual DOM (vDOM) structures, and transitions between these modes are seamlessly handled.

## Features
- Virtual DOM-based rendering with diffing and patching.
- String-based HTML template support for views.
- Lifecycle hooks (`onMount`, `onDismount`) for views and components.
- Built-in router for SPA navigation.
- State management with a global store.
- Component-based architecture for reusable UI elements.

## Installation
Simply include the framework and related files in your project:

```html
<script type="module" src="path/to/Framework.js"></script>
<script type="module" src="path/to/vdom.js"></script>
<script type="module" src="path/to/Router.js"></script>
<script type="module" src="path/to/Store.js"></script>
```

## Defining Views

### String-Based HTML Templates
Views can be defined using string-based HTML templates:

```javascript
const AboutPage = {
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
            button.addEventListener('click', () => alert('Contact us clicked!'));
        }
    },
    onDismount: () => {
        const button = document.getElementById('contactUsButton');
        if (button) {
            button.removeEventListener('click', () => alert('Contact us clicked!'));
        }
    },
};
```

### Virtual DOM Templates
You can also define views using the `h` function for virtual DOM:

```javascript
const HomePage = {
    render: () =>
        h('div', {},
            h('h1', {}, 'Home Page'),
            h('button', { id: 'goToAbout' }, 'Go to About'),
            h('button', { id: 'loginUser' }, 'Log In')
        ),
    onMount: () => {
        document.getElementById('goToAbout')?.addEventListener('click', () => router.navigate('/about'));
        document.getElementById('loginUser')?.addEventListener('click', () => alert('Logging in...'));
    },
};
```

### Switching Between HTML and Virtual DOM
The framework automatically detects if the `render` function returns a string or a virtual DOM tree and handles the rendering accordingly.

## Routing
Define routes and link them to views:

```javascript
const routes = {
    '/': { meta: { title: 'Home' }, view: HomePage },
    '/about': { meta: { title: 'About Us' }, view: AboutPage },
    '/404': {
        meta: { title: 'Page Not Found' },
        view: {
            render: () => '<h1>404 - Page Not Found</h1>',
        },
    },
};

const router = new Router(routes, app, true);
router.updateView();
```

## Components
Reusable components can be created and used across views:

```javascript
const Button = ({ text, onClick }) => ({
    render: () => `<button onclick="${onClick}">${text}</button>`,
    onMount: () => console.log(`Button mounted with text: ${text}`),
    onDismount: () => console.log(`Button dismounted with text: ${text}`),
});

const ComponentView = {
    render: () => Button({ text: 'Click Me', onClick: 'alert(\'Button clicked!\')' }).render(),
};
```

## Framework API

### `Framework.render(view)`
Renders a view using either a string-based template or virtual DOM.

### `Framework.renderComponent(Component, props, dependencies)`
Renders a reusable component.

### `Framework.clear()`
Clears the current view and its associated lifecycle hooks.

### `fadeIn()` and `fadeOut()`
Built-in methods for adding fade-in and fade-out animations during transitions.

## Example Project
```javascript
// Initialize app and store
const store = new Store({ user: null });
const app = new Framework('app', { store }, true);

const HomePage = {
    render: () => '<h1>Welcome to the Home Page</h1>',
};

const AboutPage = {
    render: () => '<h1>About Us</h1>',
};

const routes = {
    '/': { view: HomePage },
    '/about': { view: AboutPage },
};

const router = new Router(routes, app, true);
router.updateView();
```

## Debugging
Enable debug mode when creating the framework or router to log detailed information:

```javascript
const app = new Framework('app', { store }, true); // Debug mode enabled
const router = new Router(routes, app, true); // Debug mode enabled
```

