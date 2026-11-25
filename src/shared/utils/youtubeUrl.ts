const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const YOUTUBE_URL_REGEX =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|music\.youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const PLAYLIST_LIST_REGEX = /[?&]list=([a-zA-Z0-9_-]+)/;
const PLAYLIST_ID_REGEX = /^(?:PL|OLAK5uy_|UU|FL|RD)[a-zA-Z0-9_-]{10,}$/;

export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (YOUTUBE_ID_REGEX.test(trimmed)) return trimmed;

  const match = trimmed.match(YOUTUBE_URL_REGEX);
  return match ? match[1] : null;
}

export function extractYoutubePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  const listMatch = trimmed.match(PLAYLIST_LIST_REGEX);
  if (listMatch) return listMatch[1];

  return PLAYLIST_ID_REGEX.test(trimmed) ? trimmed : null;
}
