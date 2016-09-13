var KEY_VIEWED = 'gn_viewed';
var KEY_LINKS  = 'gn_links';
var KEY_TIMESTAMP = 'gn_timestamp';

function getNow() {
  return Math.floor(Date.now() / 1000);
}

function isStale(timestamp) {
  return (getNow() - timestamp) > 3600; // Timestamp is older than 1 hour
}

function randomNumber(min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function fetchLinks(callback) {
  return reddit.top('upliftingnews').t('today').limit(25).fetch(function(res) {

    var links = res.data.children || [];

    links = links.map(function(o) {
      return {
        id: o.data.id,
        title: o.data.title,
        url: o.data.url,
        domain: o.data.domain
      };
    });

    localStorage.setItem(KEY_LINKS, JSON.stringify(links));
    localStorage.setItem(KEY_VIEWED, JSON.stringify([]));
    localStorage.setItem(KEY_TIMESTAMP, getNow());

    return callback(links);
  });
}

function processLinks(links) {
  var items = JSON.parse(localStorage.getItem(KEY_VIEWED)) || [];

  if (items.length >= links.length) {
    items = [];
  }

  for (var i = 0; i < links.length; i++) {
    if (items.indexOf(links[i].id) === -1) {
      items.push(links[i].id);
      localStorage.setItem(KEY_VIEWED, JSON.stringify(items));
      return renderLink(links[i]);
    }
  }
}

function renderLink(link) {
  $('body').addClass('grad-' + randomNumber(1, 5));

  var $title = $('<a class="link-title">');

  $title.text(link.title).attr('href', link.url);

  var $source = $('<div class="link-source">');

  $source.text(link.domain);

  $('.container').append($title).append($source);
}

function main() {

  var links = JSON.parse(localStorage.getItem(KEY_LINKS)),
      timestamp = parseInt(localStorage.getItem(KEY_TIMESTAMP), 10) || 0;

  if ( !isStale(timestamp) && links ) {
    processLinks(links);
  } else {
    fetchLinks(processLinks);
  }

}

main();
