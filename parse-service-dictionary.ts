function parseTable() {
  const rowElems = document.querySelectorAll(
    '#rusApi > div.col-12.col-sm-9.col-md-8.col-lg-9.col-xl-10 > table:nth-child(47) > tbody > tr',
  );

  const dictionary = {};

  rowElems.forEach(elem => {
    const left = elem.querySelector('td:first-child');
    const right = elem.querySelector('td:last-child');

    dictionary[right.textContent] = left.textContent;
  });

  return JSON.stringify(dictionary, null, 2);
}
