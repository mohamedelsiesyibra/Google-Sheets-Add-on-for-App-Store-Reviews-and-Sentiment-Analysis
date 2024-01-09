// Function to fetch reviews from the iTunes RSS feed based on the given app ID, country, and number of pages.
function fetchReviews(appId, country, noOfPages) {
    var reviews = [];
    for (var page = 1; page <= noOfPages; page++) {
      var url = 'https://itunes.apple.com/' + country + '/rss/customerreviews/page=' + page + '/id=' + appId + '/sortBy=mostRecent/xml';
      var response = UrlFetchApp.fetch(url); 
      if (response.getResponseCode() == 200) {
        var xml = XmlService.parse(response.getContentText());
        var root = xml.getRootElement();
        var atomNS = XmlService.getNamespace('http://www.w3.org/2005/Atom');
        var itunesNS = XmlService.getNamespace('http://itunes.apple.com/rss');
        var entries = root.getChildren('entry', atomNS);
  
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          var review = {
            title: getChildText(entry, 'title', atomNS),
            content: getChildText(entry, 'content', atomNS),
            author: getChildText(entry.getChild('author', atomNS), 'name', atomNS),
            rating: getChildText(entry, 'rating', itunesNS)
          };
          if (review.title) {  // Ensure that only valid entries are added
            reviews.push(review);
          }
        }
      }
    }
    return reviews;
  }
  
  // Helper function to get the text content of a child element with a specific tag and namespace
  function getChildText(parent, tag, namespace) {
    if (parent != null) {
      var element = parent.getChild(tag, namespace);
      return element ? element.getText() : null;
    } else {
      return null;
    }
  }
  
  // Function to save the fetched reviews into a Google Sheets document
  function saveReviewsToSheet(reviews) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Clear existing data
    sheet.clear();

    var data = [['Title', 'Content', 'Author', 'Rating']];

        reviews.forEach(function(review) {
      data.push([review.title, review.content, review.author, review.rating]);
    });
  
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  }
  
  // Function to display a sidebar in the Google Sheets UI
  function showSidebar() {
    var html = HtmlService.createHtmlOutputFromFile('Sidebar')
        .setTitle('Fetch Reviews')
        .setWidth(300);
    SpreadsheetApp.getUi().showSidebar(html);
  }
  
  // Main function to initiate the review fetching process
  function main(appId) {
    var country = 'us'; // Replace with the desired country code
    var noOfPages = 2; // Number of pages to fetch """ max=10 """
  
    var reviews = fetchReviews(appId, country, noOfPages);
    saveReviewsToSheet(reviews);
  }
  
  // Function to create a custom menu in the Google Sheets UI when the spreadsheet opens
  function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Reviews')
      .addItem('Fetch Reviews', 'showSidebar')
      .addToUi();
  }
  
  