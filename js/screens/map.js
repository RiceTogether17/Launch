/** The journey map: every workbook page as a token, grouped by skill run. */

import { el, starString } from '../dom.js';
import { PAGES, pageIcon, pageTitle } from '../data/pages.js';
import { isUnlocked, nextPage, resultFor } from '../state.js';
import { toast } from '../fx.js';

const STAGE_SIZE = 10;

/**
 * The workbook interleaves skills — two sound pages, a writing page, two more
 * sound pages — so grouping by skill would leave a heading above almost every
 * single tile. Group into fixed stages instead and let each node's icon say
 * what kind of page it is.
 */
function sections() {
  const out = [];
  for (let i = 0; i < PAGES.length; i += STAGE_SIZE) {
    const pages = PAGES.slice(i, i + STAGE_SIZE);
    out.push({
      title: `Stage ${out.length + 1}`,
      span: `pages ${pages[0].page}–${pages.at(-1).page}`,
      pages,
    });
  }
  return out;
}

export function render(host, go) {
  const next = nextPage();
  const map = el('div.map');

  for (const section of sections()) {
    const cleared = section.pages.filter((p) => resultFor(p.page)?.done).length;
    map.append(el('div.map-section', {
      text: `${section.title} · ${section.span} · ${cleared}/${section.pages.length} done`,
    }));

    const grid = el('div.map-grid');
    for (const page of section.pages) {
      const result = resultFor(page.page);
      const unlocked = isUnlocked(page.page);
      const classes = [
        'node',
        result?.done ? 'done' : '',
        page.page === next ? 'next' : '',
        unlocked ? '' : 'locked',
      ].filter(Boolean).join(' ');

      grid.append(
        el(`button.${classes.split(' ').join('.')}`, {
          type: 'button',
          title: pageTitle(page),
          'aria-label': `Page ${page.page}: ${pageTitle(page)}${unlocked ? '' : ' (locked)'}`,
          onclick: () => {
            if (!unlocked) {
              toast('Finish the page before this one first.', { icon: '🔒' });
              return;
            }
            go(`#/page/${page.page}`);
          },
        }, [
          el('span.icon', { text: unlocked ? pageIcon(page) : '🔒' }),
          el('span.num', { text: `Page ${page.page}` }),
          el('span.stars', { text: result?.done ? starString(result.stars) : '' }),
        ]),
      );
    }
    map.append(grid);
  }

  host.append(
    el('div.stack', {}, [
      el('div.prompt', {}, [
        el('span.big-emoji', { text: '🗺️' }),
        el('div', {}, [
          el('h2', { text: 'Your journey' }),
          el('p.instruction', { text: 'Every page of WorkBook 1. Finish one to open the next — or replay any page for more stars.' }),
        ]),
      ]),
      map,
    ]),
  );
}
