import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export const buildInvoicePdf = async (
  element: HTMLElement,
  fileName: string,
): Promise<File> => {
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
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
  const renderWidth = canvas.width * ratio
  const renderHeight = canvas.height * ratio
  const x = (pageWidth - renderWidth) / 2
  const y = 24

  pdf.addImage(imageData, 'PNG', x, y, renderWidth, renderHeight)
  const blob = pdf.output('blob')
  return new File([blob], `${fileName}.pdf`, { type: 'application/pdf' })
}
