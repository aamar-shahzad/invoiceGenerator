export const buildInvoicePdf = async (
  element: HTMLElement,
  fileName: string,
): Promise<File> => {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const exportHost = document.createElement('div')
  exportHost.style.position = 'fixed'
  exportHost.style.left = '-10000px'
  exportHost.style.top = '0'
  exportHost.style.width = '1024px'
  exportHost.style.background = '#ffffff'
  exportHost.style.zIndex = '-1'

  const clonedElement = element.cloneNode(true) as HTMLElement
  clonedElement.style.width = '980px'
  clonedElement.style.maxWidth = '980px'
  clonedElement.style.margin = '0 auto'
  exportHost.appendChild(clonedElement)
  document.body.appendChild(exportHost)

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(clonedElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 1280,
      windowHeight: 1800,
    })
  } finally {
    document.body.removeChild(exportHost)
  }

  const imageData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'pt', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const renderWidth = pageWidth - margin * 2
  const renderHeight = (canvas.height * renderWidth) / canvas.width
  const usableHeight = pageHeight - margin * 2

  let currentOffset = 0
  pdf.addImage(imageData, 'PNG', margin, margin - currentOffset, renderWidth, renderHeight)

  while (currentOffset + usableHeight < renderHeight) {
    currentOffset += usableHeight
    pdf.addPage()
    pdf.addImage(imageData, 'PNG', margin, margin - currentOffset, renderWidth, renderHeight)
  }

  const blob = pdf.output('blob')
  return new File([blob], `${fileName}.pdf`, { type: 'application/pdf' })
}
