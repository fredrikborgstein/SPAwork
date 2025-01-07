import { h } from './vdom.js';

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

export default HomeView;