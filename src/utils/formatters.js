export function getMediaGlyph(type) {
  switch (type) {
    case "link":
      return "🔗";
    case "file":
      return "📄";
    case "image":
      return "🖼️";
    case "video":
      return "🎥";
    case "voice":
      return "🎙️";
    case "text":
    default:
      return "📝";
  }
}

export function getSourceLabel(source) {
  return source === "share" ? "Shared" : "Manual";
}
