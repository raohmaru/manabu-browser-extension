const regex: RegExp = /\{\{([^}]*)}}/g;
// [\s\S] ➡ match all characters including new lines
const evalRegex: RegExp = /\$\{([\s\S]+?)(?!}$)\}\$/g;
const eventParamRegex: RegExp = /:(\w+)="\s*([^"]+)\s*"/g;
const namespace = '_';

/**
 * Parse a template string and return a function that can be used to replace the variables in the template with actual values.
 * @param {string} expr - The template string to be parsed.
 * @returns {Function} - A function that takes an object or array of values and returns the parsed template string with the variables replaced by their corresponding values.
 */
export const parseTemplate = (expr: string) :Function => {
    return (data: Object|string[], showVarIfNull: boolean = true) => {
        let i: number = 0;
        let parsed :string = expr
            .replaceAll('\n', '')
            .replace(evalRegex, (s: string, p1: string) => {
                // Indirect eval
                // https://esbuild.github.io/content-types/#direct-eval
                const sanitized :string = p1.replaceAll('./', 'env.');
                return (new Function('env', `return ${sanitized}`))(data);
            })
            // Parse event and normalize them to use with bindEvents()
            .replace(eventParamRegex, (s: string, p1: string, p2: string) => {
                return s
                    .replace(':', namespace)
                    .replace('(', ',')
                    .replace(')', '');
            });

        return parsed.replace(regex, (s: string, p1: string) => {
            if (Array.isArray(data)) {
                return (data as any)[p1 || i++] || (showVarIfNull ? s : '');
            }
            // Get property of object using a string with dot notation
            return p1.split('.').reduce((o: Object, i: string) => (o as any)[i] ?? (showVarIfNull ? s : ''), data || {});
        });
    };
};

const xquery = `@*[starts-with(name(), "${namespace}")]`;
// Search in the root node and children nodes
const xpath = `${xquery} | *//${xquery}`;

/**
 * Binds events to elements based on the attributes defined in the template.
 * @param {object} obj - The object containing the methods to be bound to the events.
 * @param {Element|DocumentFragment} node - The root node or document fragment to search for elements with event attributes.
 */
export const bindEvents = (obj: { [key: string]: Function }, node: Element|DocumentFragment) => {
    const evaluator = new XPathEvaluator();
    let nodes: Element[] = [];
    if (node instanceof DocumentFragment) {
        nodes = nodes.concat(Array.from(node.children));
    } else {
        nodes.push(node);
    }
    nodes.forEach((n) => {
        // Evaluate the XPath expression to find all attributes that start with the namespace prefix
        const result = evaluator.evaluate(
            xpath,
            n,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        for (let i = 0; i < result.snapshotLength; i++) {
            const attr = <Attr>result.snapshotItem(i);
            const el = attr.ownerElement;
            const event = attr.name.substring(1);
            let [func, ...params] = attr.value.replace(/,$/, '').split(',');
            params = params
                // Remove extra quotes
                .map((param) => param.replace(/^'|'$/g, ''))
                // Convert params from string to its intended type
                .map((param) => {
                    try {
                        return JSON.parse(param);
                    } catch(err) {
                        return param;
                    }
                });
            // Bind event to object method passing event + optional arguments
            el?.addEventListener(event, (e) => obj[func]?.apply(obj, [e, ...params]));
            // el?.removeAttribute(attr.name);
        }
    })
};
