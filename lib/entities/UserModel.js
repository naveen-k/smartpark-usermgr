module.exports = {
  "fields": {
    "id" : {
      "type" : "text"
    },
    "first_name" : {
      "type" : "text",
      "default": null
    },
    "last_name" : {
      "type" : "text",
      "default": null
    },
    "contact" : {
      "type" : "text",
      "default": null
    },
    "email" : {
      "type" : "text",
      "default" : null
    },
    "join_date" : {
      "type": "timestamp",
      "default" : { "$db_function": "dateOf(now())" }
    },
    "avatar" : {
      "type" : "text",
      "default" : null
    },
    "address" : {
      "type":"map",
      "typeDef" : "<text, text>",
      "default" : null
    },
    "cars" : {
      "type" : "list",
       "typeDef" : "<frozen <user_car>>",
      "default" : null
    },
    "favorite_garages" : {
      "type" : "list",
      "typeDef" : "<frozen <user_favorite_garage>>",
      "default" : null
    }
  },
  "key":["id"]
}