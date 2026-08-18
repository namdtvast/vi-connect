import assert from "node:assert/strict";
import test from "node:test";
import { parseOpenAlexAuthor } from "../lib/integrations/openalex";
import { parseRorSearchResults } from "../lib/integrations/ror";
import { extractDoi, parseCrossrefWork } from "../lib/integrations/crossref";

// Fixture rút gọn từ phản hồi thật của api.openalex.org/authors/orcid:0000-0002-1825-0097
const OPENALEX_FIXTURE = {
  id: "https://openalex.org/A5107823909",
  orcid: "https://orcid.org/0000-0002-1825-0097",
  display_name: "A Gutiérrez",
  works_count: 2,
  cited_by_count: 65,
  summary_stats: { h_index: 1, i10_index: 1 },
  topics: [
    {
      display_name: "Schizophrenia research and treatment",
      field: { display_name: "Medicine" },
    },
  ],
};

test("parseOpenAlexAuthor bóc tách đúng fixture thật", () => {
  const author = parseOpenAlexAuthor(OPENALEX_FIXTURE);
  assert.ok(author);
  assert.equal(author?.displayName, "A Gutiérrez");
  assert.equal(author?.worksCount, 2);
  assert.equal(author?.hIndex, 1);
  assert.equal(author?.topics.length, 1);
  assert.equal(author?.topics[0].fieldDisplayName, "Medicine");
});

test("parseOpenAlexAuthor trả null khi thiếu id/display_name", () => {
  assert.equal(parseOpenAlexAuthor({ works_count: 1 }), null);
  assert.equal(parseOpenAlexAuthor(null), null);
});

// Fixture rút gọn từ phản hồi thật của api.ror.org/v2/organizations?query=Vietnam Academy of Science
const ROR_FIXTURE = {
  items: [
    {
      id: "https://ror.org/02wsd5p50",
      names: [
        { types: ["acronym"], value: "VAST" },
        { types: ["ror_display", "label"], value: "Vietnam Academy of Science and Technology" },
        { types: ["label"], value: "Viện Hàn lâm Khoa học và Công nghệ Việt Nam" },
      ],
      locations: [{ geonames_details: { country_name: "Vietnam" } }],
      links: [{ type: "website", value: "https://vast.gov.vn" }],
    },
  ],
};

test("parseRorSearchResults ưu tiên tên ror_display và gom acronym", () => {
  const results = parseRorSearchResults(ROR_FIXTURE);
  assert.equal(results.length, 1);
  assert.equal(results[0].name, "Vietnam Academy of Science and Technology");
  assert.deepEqual(results[0].acronyms, ["VAST"]);
  assert.equal(results[0].country, "Vietnam");
  assert.equal(results[0].website, "https://vast.gov.vn");
});

test("parseRorSearchResults trả mảng rỗng khi không có items", () => {
  assert.deepEqual(parseRorSearchResults({}), []);
  assert.deepEqual(parseRorSearchResults(null), []);
});

test("extractDoi rút DOI từ URL hoặc chuỗi trần", () => {
  assert.equal(extractDoi("https://doi.org/10.1038/nature12373"), "10.1038/nature12373");
  assert.equal(extractDoi("DOI: 10.1038/nature12373."), "10.1038/nature12373");
  assert.equal(extractDoi("không có doi ở đây"), null);
});

// Fixture rút gọn từ phản hồi thật của api.crossref.org/works/10.1038/nature12373
const CROSSREF_FIXTURE = {
  message: {
    DOI: "10.1038/nature12373",
    title: ["Nanometre-scale thermometry in a living cell"],
    author: [{ given: "G.", family: "Kucsko" }],
    "container-title": ["Nature"],
    published: { "date-parts": [[2013]] },
  },
};

test("parseCrossrefWork bóc tách đúng fixture thật", () => {
  const work = parseCrossrefWork(CROSSREF_FIXTURE);
  assert.ok(work);
  assert.equal(work?.doi, "10.1038/nature12373");
  assert.equal(work?.title, "Nanometre-scale thermometry in a living cell");
  assert.deepEqual(work?.authors, ["G. Kucsko"]);
  assert.equal(work?.containerTitle, "Nature");
  assert.equal(work?.year, 2013);
});

test("parseCrossrefWork trả null khi thiếu title", () => {
  assert.equal(parseCrossrefWork({ message: { DOI: "10.1/x" } }), null);
});
