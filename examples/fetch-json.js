'use strict';

/**
 * Fetching JSON results from a REST API
 *
 * The following example retrieves a list of comments and lists them in Alfred. The entries are filtered by user input
 * and both the name and email fields are searched for matches.
 */

const Hugo = require('alfred-hugo');

Hugo.fetch('http://jsonplaceholder.typicode.com/comments')
    .then(function (body) {
        let items = body;

        // Filter items name and email fields by user input
        items = Hugo.matches(items, Hugo.input, {
            keys: ['name', 'email']
        });

        // Map our filtered API response items to Alfred items
        items = Hugo.map(x => ({
            title: x.name,
            subtitle: x.email,
            arg: x.id
        }));

        // Add items to Hugo
        Hugo.addItems(items);

        // Display items
        Hugo.feedback();
    });
