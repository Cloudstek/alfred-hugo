'use strict';

/**
 * Multiple acitons in one file
 *
 * A very easy way to split your code whilst not having to split it up in seperate files, keeping things nice and tidy.
 */

const Hugo = require('alfred-hugo');

// Aliens action (/usr/local/bin/node index.js aliens "$1")
Hugo.action('aliens', query => {
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

    Hugo.filterItems(query);
});

// Zombies action (/usr/local/bin/node index.js zombies "$1")
Hugo.action('zombies', query => {
    Hugo.addItems([
        {
            title: 'My book about zombies',
            subtitle: 'It\'s awesome, read it.',
            arg: 'rotting flesh'
        },
        {
            title: 'My book about the undead',
            subtitle: 'Not as great as my book about zombies, but a decent read.',
            arg: 'undead beings'
        }
    ]);

    Hugo.filterItems(query);
});

Hugo.feedback();
