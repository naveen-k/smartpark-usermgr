module.exports = {
  "fields": {
    "id" : {
      "type" : "varchar"
    },
    "description" : {
      "type" : "text",
      "default": null
    },
    "contact" : {
      "type" : "text",
      "default": null
    },
    "online" : {
      "type" : "boolean",
      "default" : false
    },
    "image" : {
      "type" : "text",
      "default" : null
    },
     "address" : {
      "type":"map",
      "typeDef" : "<text, text>",
      "default" : null
    },
    "hours" : {
      "type" : "map",
      "typeDef" : "<text, text>",
      "default" : null
    },
    "location" : {
      "type" : "map",
      "typeDef" : "<text, float>",
      "default" : null
    },
    "capacity": {
      "type" : "map",
      "typeDef" : "<text, int>",
      "default": null
    },
    "rates" : {
      "type" : "list",
      "typeDef" : "<frozen <garage_rate>>",
      "default" : null
    },
    "revenue" : {
      "type" : "list",
      "typeDef" : "<frozen <garage_revenue>>",
      "default" : null
    },
    "devices" : {
      "type" : "list",
      "typeDef" : "<frozen <garage_device>>",
      "default" : null
    }
  },
  "key":["id"]
}