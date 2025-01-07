class Store {
    constructor(initialState) {
        this.state = initialState;
        this.listeners = [];
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function to execute on state update
     */
    subscribe(listener) {
        this.listeners.push(listener);
    }

    /**
     * Update the state and notify all subscribers
     * @param {Object} newState - The new state to merge with the existing state
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach((listener) => listener(this.state));
    }

    /**
     * Get the current state
     * @returns {Object} - The current state
     */
    getState() {
        return this.state;
    }
}

export default Store;
