const track = document.querySelector('#brand-track')
const originalSet = track?.querySelector('.brand-carousel__set')

if (track && originalSet) {
  const duplicateSet = originalSet.cloneNode(true)
  duplicateSet.setAttribute('aria-hidden', 'true')
  duplicateSet.querySelectorAll('img').forEach((image) => image.setAttribute('alt', ''))
  track.appendChild(duplicateSet)
}