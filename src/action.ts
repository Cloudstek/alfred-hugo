export class Action {
    private actions: Action[];
    private name: string;
    private callback?: (query: string[]) => void;

    public constructor(name: string, callback?: (query: string[]) => void) {
        this.name = name;
        this.callback = callback;
        this.actions = [];
    }

    public action(name: string, callback: (query: string[]) => void): Action {
        const action = new Action(name, callback);

        this.actions.push(action);

        return action;
    }

    public run(args: string[]) {
        if (args.length === 0) {
            return false;
        }

        if (args[0] === this.name) {
            const subargs = args.slice(1);

            // Check sub actions first
            for (const action of this.actions) {
                if (action.run(subargs) === true) {
                    return true;
                }
            }

            // Run self
            if (this.callback) {
                this.callback(args.slice(1));
                return true;
            }
        }

        return false;
    }
}
