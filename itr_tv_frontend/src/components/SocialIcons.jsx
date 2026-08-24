const base = {
  viewBox: "0 0 24 24", width: 18, height: 18, fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
};

export function FacebookIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function InstagramIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <path d="M10.3 9.3l5 2.7-5 2.7z" fill="currentColor" stroke="currentColor" />
    </svg>
  );
}

export function WhatsappIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8.9 19.7L4 20z" />
      <path
        d="M9 9.6c0 3 2.4 5.4 5.4 5.4.5 0 .9-.4.9-.9v-.9c0-.4-.3-.8-.7-.9l-1.5-.4a.9.9 0 0 0-.9.2l-.3.3a4.7 4.7 0 0 1-2.3-2.3l.3-.3a.9.9 0 0 0 .2-.9l-.4-1.5a.9.9 0 0 0-.9-.7h-.9c-.5 0-.9.4-.9.9z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function LinkedinIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" />
      <circle cx="7.5" cy="7" r="0.7" fill="currentColor" stroke="none" />
      <path d="M11.5 16.5v-3.8a2.2 2.2 0 0 1 4.3 0v3.8" />
      <line x1="11.5" y1="10.5" x2="11.5" y2="16.5" />
    </svg>
  );
}

export function TiktokIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M13 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M13 4c.5 2.5 2.3 4.3 4.5 4.6" />
    </svg>
  );
}
