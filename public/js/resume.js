//TODO -- This javascript may need to be in page to allow for the changing of url.

var id = window.location.hash.substring(1);

$(document).ready(function () {

  // If absolute URL from the remote server is provided, configure the CORS
  // header on that server.
  var url = '/content/resume/user/' + id;

  /*************************
   * Upload Button
   *
   * @params: null
   *
   * Functions for upload buttons
   *************************/

  $('#selectButton').click(function () {

    $('#resumeIn').click();

  });

  $('#uploadButton').click(function () {

    var resForm = new FormData();
    resForm.append("file", $("#resumeIn")[0].files[0]);
    $.ajax({
        xhr: function () {
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
              var percentComplete = evt.loaded / evt.total;
              percentComplete = parseInt(percentComplete * 100);
              $("#resumeProgress").progressbar({
                value: percentComplete
              });

              if (percentComplete === 100) {

              }

            }
          }, false);
          return xhr;
        },
        url: url, //Get :uid from the return.
        type: 'post',
        data: resForm,
        cache: false,
        contentType: false,
        processData: false,
      })
      .done(function () {
        window.location.reload();
      })
      .fail(function () {
        window.location.reload();
      })


  });

  /*************************
   * Functions for PDF viewer
   *
   *@params: null
   *
   * List of functions for downloading and displaying PDFs in any browser.
   **************************/




  console.log(url)

  // The workerSrc property shall be specified.
  PDFJS.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

  var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 0.8,
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
      var viewport = page.getViewport(scale);
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    // Update page counters
    document.getElementById('page_num').textContent = pageNum;
  }

  /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  /**
   * Displays previous page.
   */
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }
  document.getElementById('pdfPrev').addEventListener('click', onPrevPage);

  /**
   * Displays next page.
   */
  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }
  document.getElementById('pdfNext').addEventListener('click', onNextPage);

  /**
   * Asynchronously downloads PDF.
   */

  let pdfChangeURL = function (path) {
    PDFJS.getDocument(path).then(function (pdfDoc_) {
      pdfDoc = pdfDoc_;
      pageNum = 1;
      document.getElementById('page_count').textContent = pdfDoc.numPages;

      // Initial/first page rendering
      renderPage(pageNum);
    });
  };
  pdfChangeURL(url);
  $("#loadResume").click(
    function () {
      pdfChangeURL("../content/resume/user/" + $("#pathResume").val());
    }
  );
});