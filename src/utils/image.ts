export const getArtworkUri = (artworkPath: string | undefined): string | undefined => {
  if (!artworkPath) return undefined;
  if (artworkPath.startsWith('http://') || artworkPath.startsWith('https://') || artworkPath.startsWith('content://')) {
    return artworkPath;
  }
  return 'file://' + artworkPath;
};
