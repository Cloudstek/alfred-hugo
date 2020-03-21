export class Action {
    private readonly actions: Action[];
    private readonly names: string[];
    private readonly callback?: (args: string[]) => void;

    public constructor(name: string|string[], callback?: (args: string[]) => void) {
        if (typeof name === 'string') {
            name = [name];
        }

        this.names = name;
        this.callback = callback;
        this.actions = [];

        if (this.names.length === 0) {
            throw new Error('Action has no name or aliases.');
        }

        for (const n of this.names) {
            if (n.trim().length === 0) {
                throw new Error('Action name or alias cannot be empty an empty string.');
            }
        }
    }

    /**
     * Run a callback when script argument matches keyword. Callback wil have remaining arguments as argument.
     *
     * @example node index.js firstaction secondaction "my query"
     *
     * @param name Action name and optionally aliases
     * @param callback Callback to execute when query matches action name
     *
     * @return Action
     */
    public action(name: string|string[], callback: (args: string[]) => void): Action {
        const action = new Action(name, callback);

        this.actions.push(action);

        return action;
    }

    public run(args: string[]): boolean {
        if (args.length === 0) {
            return false;
        }

        if (this.names.includes(args[0])) {
            const subArgs = args.slice(1);

            // Check sub actions first
            for (const action of this.actions) {
                if (action.run(subArgs) === true) {
                    return true;
                }
            }

            // Run self
            if (this.callback) {
                this.callback(subArgs);
                return true;
            }
        }

        return false;
    }
}
