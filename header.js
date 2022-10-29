var h = preact.h;
const SECTIONS = [
  'spreadsheet', 'new', 'load', 'save', 'help', 'about'
];

function NavbarLink({ label }) {
  const hash = window.location.hash.slice(1) || 'about';

  return (
    h("button", {
      disabled: hash === label,
      class: "btn btn-light w3-text-theme",
      style: { textTransform: "capitalize" },
      onClick: () => window.location.hash = label
    }, label)
  )
}

const copyright = [
  "site design and logo",
  h("br", null),
  "\xA9 Athran Zuhail 2022 all\xA0rights\xA0reserved"
]

const LinkBar = () => (
  h("nav", { class: "btn-group" },
    SECTIONS.map(s =>
      h(NavbarLink, { label: s }))))

const LinkBeam1 = () => (
  h("nav", { class: "btn-group" },
    SECTIONS.slice(4, 6).map(s =>
      h(NavbarLink, { label: s }))))

const LinkBeam2 = () => (
  h("nav", { class: "btn-group" },
    SECTIONS.slice(0, 4).map(s =>
      h(NavbarLink, { label: s }))))

export default function Navbar() {
  return [
    h("header", { class: "w3-theme-l1 p-2 shadow d-none d-md-flex" },
      h("div", { class: "h1 m-0" }, "Daddy\xA0Kassy"),
      LinkBar(),
      h("div", { class: "copyright" }, ...copyright)),
    h("header", { class: "w3-theme-l1 p-2 shadow d-flex d-md-none" },
      h("span", { class: "h2 m-0" }, "Daddy Kassy"),
      LinkBeam1()),
    h("header", { class: "w3-theme-l1 p-2 shadow d-flex d-md-none" },
      h("div"),
      LinkBeam2()
    )
  ];
}
