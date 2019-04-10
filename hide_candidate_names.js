const alphabeta = '23456789abdegjkmnpqrvwxyz';
const id_len = 8;
const max_retries = 10;
const names_to_ids = {};
const allocated_ids = new Set();

function generate_id(name, retries = 0) {
  if (names_to_ids[name]) {
    return names_to_ids[name];
  } else {
    let id = '';
    for (let i = 0; i < id_len; i++) {
      id += alphabeta.charAt(Math.floor(Math.random() * alphabeta.length));
    }
    if (allocated_ids.has(id)) {
      if (retries < max_retries) {
        return generate_id(retries + 1);
      } else {
        throw new Error(`Unable to generate a unique id after ${retries} attempts.`);
      }
    } else {
      names_to_ids[name] = id;
      allocated_ids.add(id);
      return id;
    }
  }
}

/**
 * A list of CSS selectors identifying elements that contain the candidates
 * names.
 *
 * We use attribute selectors in some cases so we can fuzzy match, as the
 * class names used by greenhouse on certain pages clearly include an
 * auto-generated bit that's likely to change with each n' every deploy.
 * There is of course some risk of this still, but less so.
 */

const candidateNameSelectors = [
  '[class*="item__CandidateLink"]',
  '.person-name',
  '.person-info-column .name'
];

const candidateEmailSelectors = [
  '.email-candidate-icon',
  '.contact-info-item > a'
]

function hide_candidate_names() {
  candidateNameSelectors.forEach(selector => {
    Array.from(document.querySelectorAll(selector)).forEach(node => {
      node.setAttribute('data-raw-value', node.textContent);
      node.textContent = generate_id(node.textContent);
    });
  });

  candidateEmailSelectors.forEach(selector => {
    Array.from(document.querySelectorAll(selector)).forEach(node => {
      const [ name, host ] = node.textContent.split('@');
      node.setAttribute('data-raw-value', node.textContent);
      node.textContent = `${generate_id(node.textContent)}@${host}`;
    });
  });
}

function isReady() {
  return document.readyState === 'complete' || document.readyState === 'interactive';
}

if (isReady()) {
  hide_candidate_names();
} else {
  const handleReadyStateChange = () => {
    if (isReady()) {
      document.removeEventListener('readystatechange', handleReadyStateChange);
      hide_candidate_names();
    }
  }
  document.addEventListener('readystatechange', handleReadyStateChange());
}
