function doGet(e) {
  var type = e.parameter.type;
  var action = e.parameter.action;
  
  if (type === 'listing' || action === 'getFeaturedListing') {
    return getFeaturedListing();
  } else if (type === 'jeff_blog' || action === 'getBlogPosts') {
    return getBlogPosts();
  } else if (type === 'photos' || action === 'getCommunityPhotos') {
    return getCommunityPhotos();
  } else {
    return getBlogPosts();
  }
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  
  if (data.type === 'photos') {
    if (data.action === 'save') {
      return addCommunityPhoto(data);
    } else if (data.action === 'delete') {
      return deleteCommunityPhoto(data);
    } else if (data.action === 'update') {
      return updateCommunityPhoto(data);
    }
  }
  
  if (data.action === 'addCommunityPhoto') {
    return addCommunityPhoto(data);
  } else if (data.action === 'deleteCommunityPhoto') {
    return deleteCommunityPhoto(data);
  } else if (data.inquiry_type) {
    return handleInquiry(data);
  }
  
  // Accept both 'blog' and 'jeff_blog'
  if (data.type === 'jeff_blog' || data.type === 'blog') {
    return saveBlogPost(data);
  } else if (data.type === 'listing') {
    return saveListing(data);
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Unknown action'}))
      .setMimeType(ContentService.MimeType.JSON);
}

function getFeaturedListing() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jeffs-featured-listings');
  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return ContentService.createTextOutput(JSON.stringify(null))
        .setMimeType(ContentService.MimeType.JSON);
  }
  
  var row = data[1];
  var listing = {
    photo: row[0],
    address: row[1],
    price: row[2],
    agent: row[3],
    beds: row[4],
    baths: row[5],
    sqft: row[6],
    mls: row[7]
  };
  
  return ContentService.createTextOutput(JSON.stringify(listing))
      .setMimeType(ContentService.MimeType.JSON);
}

function getBlogPosts() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jeffs-blogs-insights');
  var data = sheet.getDataRange().getValues();
  var posts = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0]) {
      posts.push({
        id: row[0],
        title: row[1],
        author: row[2],
        image: row[3],
        content: row[4],
        date: row[5]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(posts))
      .setMimeType(ContentService.MimeType.JSON);
}

function getCommunityPhotos() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Community-photos');
  var data = sheet.getDataRange().getValues();
  var photos = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] && row[1]) {
      photos.push({
        id: row[0],
        url: row[1],
        caption: row[2] || ''
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(photos))
      .setMimeType(ContentService.MimeType.JSON);
}

function addCommunityPhoto(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Community-photos');
  var id = data.id || Utilities.getUuid();
  sheet.appendRow([id, data.url, data.caption || '']);
  
  return ContentService.createTextOutput(JSON.stringify({success: true, id: id}))
      .setMimeType(ContentService.MimeType.JSON);
}

function updateCommunityPhoto(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Community-photos');
  var dataRange = sheet.getDataRange().getValues();
  
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === data.id) {
      sheet.getRange(i + 1, 3).setValue(data.caption);
      return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Photo not found'}))
      .setMimeType(ContentService.MimeType.JSON);
}

function deleteCommunityPhoto(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Community-photos');
  var dataRange = sheet.getDataRange().getValues();
  
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      return ContentService.createTextOutput(JSON.stringify({success: true}))
          .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Photo not found'}))
      .setMimeType(ContentService.MimeType.JSON);
}

function saveBlogPost(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jeffs-blogs-insights');
  
  if (data.action === 'delete') {
    var dataRange = sheet.getDataRange().getValues();
    for (var i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] === data.id) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({success: true}))
            .setMimeType(ContentService.MimeType.JSON);
      }
    }
  } else if (data.editId) {
    // UPDATE existing post
    var dataRange = sheet.getDataRange().getValues();
    for (var i = 1; i < dataRange.length; i++) {
      if (dataRange[i][0] === data.editId) {
        var row = i + 1;
        sheet.getRange(row, 2).setValue(data.title);
        sheet.getRange(row, 3).setValue(data.author);
        sheet.getRange(row, 4).setValue(data.image);
        sheet.getRange(row, 5).setValue(data.content);
        return ContentService.createTextOutput(JSON.stringify({success: true, id: data.editId}))
            .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({error: 'Post not found for update'}))
        .setMimeType(ContentService.MimeType.JSON);
  } else {
    // NEW post
    var id = data.id || Utilities.getUuid();
    sheet.appendRow([id, data.title, data.author, data.image, data.content, data.date || new Date()]);
    return ContentService.createTextOutput(JSON.stringify({success: true, id: id}))
        .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
}

function saveListing(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Jeffs-featured-listings');
  
  if (data.action === 'delete') {
    if (sheet.getLastRow() > 1) {
      sheet.deleteRow(2);
    }
  } else {
    if (sheet.getLastRow() > 1) {
      sheet.deleteRow(2);
    }
    sheet.appendRow([data.photo, data.address, data.price, data.agent, data.beds, data.baths, data.sqft, data.mls]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
}

function handleInquiry(data) {
  var sheetMap = {
    'want-to-sell': 'Want-to-Sell',
    'want-to-buy': 'Want-to-Buy',
    'want-to-build': 'Want-to-Build',
    'want-to-invest': 'Want-to-Invest',
    'lets-go-look': 'Lets-go-Look',
    'open-house-registration': 'Open-House-Registration',
    'newsletter': 'Newsletter-Sign-Up'
  };
  
  var sheetName = sheetMap[data.inquiry_type];
  if (!sheetName) {
    return ContentService.createTextOutput(JSON.stringify({error: 'Unknown inquiry type: ' + data.inquiry_type}))
        .setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  sheet.appendRow([data.timestamp, data.first_name, data.last_name, data.email, data.phone, data.message]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
}
