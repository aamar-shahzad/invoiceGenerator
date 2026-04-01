const triggerDownload = (file: File): void => {
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.click()
  URL.revokeObjectURL(url)
}

export const shareOrDownloadFile = async (
  file: File,
  title: string,
): Promise<'shared' | 'downloaded'> => {
  const canUseNativeShare =
    'share' in navigator &&
    'canShare' in navigator &&
    navigator.canShare({ files: [file] })

  if (canUseNativeShare) {
    await navigator.share({
      title,
      files: [file],
    })
    return 'shared'
  }

  triggerDownload(file)
  return 'downloaded'
}
