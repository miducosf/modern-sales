function showToast(msg){
  const toast=document.getElementById('toast');
  toast.textContent=msg;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2000);
}
function openEmail(){ showToast('Open Email App'); }
function openText(){ showToast('Open Text App'); }
function openVideo(){ showToast('Open Video Chat'); }
function openCalendar(){ showToast('Open Calendar App'); }
function openTasks(){ showToast('Open Tasks App'); }
function openPhotos(){ showToast('Open Photos App'); }
