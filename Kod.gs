var cc = DataStudioApp.createCommunityConnector();

function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
}

function getConfig(request) {
  var config = cc.getConfig();
  
  config.newInfo()
    .setId('instructions')
    .setText('Enter start and end date for report');

  
  config.setDateRangeRequired(true);
  
  return config.build();
}

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  
  fields.newDimension()
    .setId('date')
    .setName('date')
    .setType(types.YEAR_MONTH_DAY);
  
  fields.newDimension()
    .setId('sales_count')
    .setName('sales_count')
    .setType(types.NUMBER);

  fields.newDimension()
    .setId('sold_product_count')
    .setName('sold_product_count')
    .setType(types.NUMBER);

  fields.newDimension()
    .setId('margin')
    .setName('margin')
    .setType(types.NUMBER);

  fields.newDimension()
    .setId('new_product')
    .setName('new_product')
    .setType(types.NUMBER);
  
  return fields;
}

function getSchema(request) {
  var fields = getFields(request).build();
  return { schema: fields };
}

function formatData(requestedFields, rowData) {
  var row = requestedFields.asArray().map(function(requestedField) {
    switch (requestedField.getId()) {
      case 'date':
        return rowData.date.replaceAll("-", "");
      case 'sales_count':
        return rowData.sales_count;
      case 'sold_product_count':
        return rowData.sold_product_count;
      case 'margin':
        return rowData.margin;
      case 'new_product':
        return rowData.new_product;
      default:
        return '';
    }
  });
  return {values: row};
}

function getFormattedData(fetchedData, requestedFields) {
  var data = fetchedData.map(function(rowData) {
    return formatData(requestedFields, rowData);
  });
  Logger.log(data);
  return data;
}



function getData() {
 var requestedFields = getFields();
 
  var options = {
     "async": true,
     "crossDomain": true,
     "method" : "GET",
     "headers" : {
       "X-R2S-Token" : "3WV0pTIW11IX5TvfeKWOfcec73b3de303268c248ecdf5f3a91afc6c05bde1f52",
       "Content-Type": "application/json",
       "x-r2s-api-user": "r2s-logo"
     }
   };

  // Fetch and parse data from API
  var url = 'http://api.v2.ready2sale.com/stat/order?seller=Tsouq Shopify';
 

  var response = UrlFetchApp.fetch(url, options);
  
  var rows = JSON.parse(response).data.result;
  var data = getFormattedData(rows, requestedFields);

  return {
    schema: getSchema().schema,
    rows: data
  };
}