/**
 * Create a virtual DOM node
 * @param {string} tag - The HTML tag (e.g., 'div', 'span')
 * @param {Object} props - Attributes and properties (e.g., { id: 'myId', className: 'myClass' })
 * @param {...Array} children - Child nodes (strings or virtual DOM nodes)
 * @returns {Object} - Virtual DOM node
 */
export function h(tag, props = {}, ...children) {
    return { tag, props, children };
}

/**
 * Diff two virtual DOM trees
 * @param {Object} oldVNode - The old virtual DOM tree
 * @param {Object} newVNode - The new virtual DOM tree
 * @returns {Function} - A patch function to update the real DOM
 */
export function diff(oldVNode, newVNode) {
    if (!oldVNode && !newVNode) {
        return () => null;
    }

    if (!oldVNode) {
        return (domNode) => {
            const newDom = createElement(newVNode);
            domNode.appendChild(newDom);
            return newDom;
        };
    }

    if (!newVNode) {
        return (domNode) => {
            domNode.remove();
            return null;
        };
    }

    if (typeof oldVNode !== typeof newVNode || oldVNode.tag !== newVNode.tag) {
        return (domNode) => {
            const newDom = createElement(newVNode);
            domNode.replaceWith(newDom);
            return newDom;
        };
    }

    if (typeof newVNode === 'string' || typeof newVNode === 'number') {
        if (oldVNode !== newVNode) {
            return (domNode) => {
                domNode.textContent = newVNode;
                return domNode;
            };
        }
        return () => null;
    }

    return (domNode) => {
        updateProps(domNode, oldVNode.props, newVNode.props);

        const childPatches = [];
        const childNodes = Array.from(domNode.childNodes);

        for (let i = 0; i < Math.max(newVNode.children.length, oldVNode.children.length); i++) {
            const oldChild = oldVNode.children[i];
            const newChild = newVNode.children[i];

            if (!newChild && oldChild) {
                if (childNodes[i]) {
                    childNodes[i].remove();
                }
                continue;
            }

            if (!newChild) {
                continue;
            }

            childPatches.push(diff(oldChild, newChild));
        }

        childPatches.forEach((patch, i) => {
            const childNode = childNodes[i];
            if (patch) {
                if (!childNode) {
                    domNode.appendChild(createElement(newVNode.children[i]));
                } else {
                    patch(childNode);
                }
            }
        });

        return domNode;
    };
}


/**
 * Create a DOM node from a virtual DOM node
 * @param {Object|string} vNode - Virtual DOM node
 * @returns {HTMLElement} - DOM node
 */
export function createElement(vNode) {
    if (!vNode) {
        return document.createComment('undefined vNode');
    }

    if (typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(vNode);
    }

    if (!vNode.tag) {
        throw new Error('Invalid vNode structure: Missing tag');
    }

    const domNode = document.createElement(vNode.tag);

    for (const [key, value] of Object.entries(vNode.props || {})) {
        domNode[key] = value;
    }

    for (const child of vNode.children || []) {
        if (child) {
            domNode.appendChild(createElement(child));
        }
    }

    return domNode;
}






/**
 * Update DOM node attributes
 * @param {HTMLElement} domNode - The real DOM node
 * @param {Object} oldProps - The old attributes
 * @param {Object} newProps - The new attributes
 */
function updateProps(domNode, oldProps, newProps) {
    for (const [key, value] of Object.entries(newProps || {})) {
        if (value !== oldProps[key]) {
            domNode[key] = value;
        }
    }

    for (const key in oldProps) {
        if (!(key in newProps)) {
            domNode.removeAttribute(key);
        }
    }
}
