#API the Survivors

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`

## Running / Development

* `npm run dev`
* Visit your API at http://localhost:3000/api/survivors in postman for example.

## Running Tests

* `npm run test`


##Endpoints the API

| Route                                                 | HTTP Verb |                    Description                      |
|-------------------------------------------------------|-----------|-----------------------------------------------------|
| /api/survivors                                        | GET       | Get all survivors                                   |
| /api/survivors                                        | POST      | Create a survivor                                   |
| /api/survivors/:id                                    | GET       | Get a single survivor                               |
| /api/survivors/:id                                    | PUT       | Update a survivor with new location                 |
| /api/survivors/:id/report/:infected_id                | PUT       | One survivor accuses the other as infected          |
| /api/survivors/trade/items                            | PUT       | Markets items between two survivors                 |
| /api/survivors/reports/survivors?infected={boolean}   | GET       | Get Percentage of infected/non-infected survivors   |
| /api/survivors/reports/survivors?resource={string}    | GET       | Get Percentage of each kind of resource by survivor |
| /api/survivors/reports/survivors/pointslost           | GET       | Get Points lost because of infected survivor        |


### How to use the API 

* Create a survivors

 - `POST /api/survivors`

```javascript

{
  "name": "Survivor brown",
  "age": "34",
  "gender": "male",
  "lastLocation": [
    17,
    77
  ],
  "isInfected": false,
  "indications": [],
  "inventory": [{
    "name": "Food",
    "points": 3
  },{
    "name": "Food",
    "points": 3
  }]
}

```


* Update a survivor with new location  

 - `PUT - /api/survivors/5733425443b27c110e6fcedd`

```javascript

{
  "lastLocation": [
    17,
    0
  ]
}

```

* One survivor accuses the other as infected

 - `PUT - /api/survivors/5733425443b27c110e6fcedd/report/5733424043b27c110e6fceda`


* Markets items between two survivors: 

 - `PUT - api/survivors/trade/items`

```javascript 

// send a array with two survivors to trade
[
  {
    "id": "5733425443b27c110e6fcedd",
    "items": [{ "name": "Food", "points": 3 }, { "name": "Food", "points": 3 }]
  },
  {
    "id": "5733424043b27c110e6fceda",
    "items": [{ "name": "Water", "points": 4 },
      { "name": "Medication", "points": 2 }
    ]
  }
]

```

* Get Percentage of infected/non-infected survivors

 - `GET - /api/survivors/reports/survivors?infected=true`

 - `GET - /api/survivors/reports/survivors?infected=false`

* Get Percentage of each kind of resource by survivor

 - `GET - /api/survivors/reports/survivors?resource=water`

 - `GET - /api/survivors/reports/survivors?resource=food`