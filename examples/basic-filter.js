'use strict';

/**
 * Basic adding and filtering of items
 *
 * A very basic example of adding items and filtering them by user input. As of Alfred 3 you have the option to let
 * Alfred do the filtering. This runs the script once and then caches and filters the results. It is less flexible as it
 * only filters the output data and only by title but it is FAST! Use it if you don't require fancy filtering options.
 */

const Hugo = require('alfred-hugo');

// Add items to Hugo
Hugo.addItems([
    {
        title: 'My book about wizards',
        subtitle: 'It\'s awesome, read it.',
        arg: 'wizards'
    },
    {
        title: 'My book about unicorns',
        subtitle: 'Not as great as my book about wizards, but a decent read.',
        arg: 'unicorns'
    }
]);

// Filter added items by user input
Hugo.filterItems(Hugo.input);

// Display items
Hugo.feedback();
