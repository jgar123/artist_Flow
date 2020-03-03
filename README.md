# artist_Flow

### ![GA](https://cloud.githubusercontent.com/assets/40461/8183776/469f976e-1432-11e5-8199-6ac91363302b.png) General Assembly, Software Engineering Immersive

This is the fourth project of the software engineering immersive course at GA London. The assignment was to create a **full-stack application** using **Django REST Framework to serve data from a Postgres database**.

Artist_Flow is a platform that allows users to explore and discover new artists. In addition, users are able to store their favourite artists and find out more information regarding specific artists i.e. upcoming events they are playing at, information regarding specific events etc.

You can launch the app on Heroku [here](https://artist-flow-ga.herokuapp.com/#/), or find the GitHub repo [here](https://github.com/jgar123/artist_Flow).

## Brief
​
* **Build a full-stack application** by making your own backend and your own front-end
* **Use a Python Django API** using Django REST Framework to serve your data from a Postgres database
* **Consume your API with a separate front-end** built with React
* **Be a complete product** which most likely means multiple relationships and CRUD functionality for at least a couple of models
* **Implement thoughtful user stories/wireframes** that are significant enough to help you know which features are core MVP and which you can cut
* **Be deployed online** so it's publicly accessible.

## Technologies used
- HTML
- CSS
- Python
- Django
- Postgres
- JavaScript (ES6)
- React.js
- Deezer API
- Skiddle API
- React Toastify
- Moment
- Git and GitHub
- Bulma
- Google Fonts

## Approach

### Planning

- On the first day we came up with the idea of the app and the wireframes for all the pages.

- We planned our data structures and relationships using an ERD.

### Backend

**Models**

- We created 2 models and used Django's 'out of the box' model for our User model. We linked our artist model with the user model so the user could view artists linked with their profile only. A recent search model was added so that any valid search made on the platform would be stored and be available for any user on the platform.

- The artist model contained the clicked artist's deezerId (we used this id the API we were using to grab the artist's information was from Deezer), name and owner. The deezerId was used to look up information regarding the artists whilst the id was used to associate the user and the artist - this was added in the artist serializer.

```py
class Artist(models.Model):
    deezerId = models.IntegerField()
    name = models.CharField(max_length=64)
    owner = models.ForeignKey(
        User,
        related_name='artists',
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f'Artist {self.deezerId} - {self.name}'
```
- As previously mentioned, the artist model is linked with user model using the serializer. This allows us to call our user endpoint and retrieve all of the artists they have decided to add to their profile.

```py
class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ('id', 'deezerId', 'name', 'owner')

class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)
    artists = ArtistSerializer(many=True, required=False)

    def validate(self, data):

        password = data.pop('password')
        password_confirmation = data.pop('password_confirmation')

        if password != password_confirmation:
            raise ValidationError({'password_confirmation': 'does not match'})

        try:
            validations.validate_password(password=password)
        except ValidationError as err:
            raise serializers.ValidationError({'password': err.messages})

        data['password'] = make_password(password)
        return data

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirmation', 'artists')
```
**API End-points**

1. User

  |           	| GET 	| POST 	| PUT 	| DELETE 	|
  |-----------	|-----	|------	|-----	|--------	|
  | /register 	|     	|   x  	|     	|        	|
  | /login    	|     	|   x  	|     	|        	|
  | /profile    |   x   |       |       |         |

  - Both `/register` and `/login` have post routes where the user's data is stored in the database.
  - `/profile` has a get route only. We don't post user selected artists on this end point because we associate the selected artist with the user on the `/artists` end point.


2. Artists

  |                  | GET 	| POST 	| PUT 	| DELETE 	|
  |------------------|----- |------	|-----	|--------	|
  | /artists         |      |   x   |       |         |
  | /artists/int:pk  |      |       |       |    x    |

- `/artists` allows is used to associate the posted artist with the user id attached to that instance of the artist in the database. This then allows us to remove only one instance of the artist and not all of them in our database. 
- `/artists/int:pk` allows us to then indentify the the specific instance of adding a song associated with the user and not check for both user id and artist id occurances. This meant we only required to search for the unique pk to delete this record in our database.  

### Front-end

**Nodes**
- The 3 main pieces of state for the Nodes components were as follows:
1. `mainNode` refers to the central node which displays the users current choice. This is pre-populated from the `Home` component that grabs the deezerId of the searched artist and pushes that to the `Nodes` component. Once this has been done, the `deezerId` is obtained using `props.location.artist.deezerId` which is then used to query the Deezer API.
2. `secondaryNodes` refers to the related artists which is obtained from the first API call we make on page load. The related artists are stored in an array that can contain 20+ artists so we made the decision to restrict this to picking the first 4 in the array. Every time a specific `secondaryNode` is clicked, the clicked artist is set to `mainNode` and a call to the deezerId is made grab new related artists.
3. `thirdNode` refers to the users 'past' search. This sets the `thirdNode` to the `mainNode`'s value prior to setting the new `mainNode` to clicked `secondaryNode`. 

**Profile**
- The Profile component makes calls to the Skiddle API (for artist gigs or tours) and Deezer API. 
- This component makes an initial call to the `/profile` end point. This grabs all of the users artists associated with their account and then renders all of the artists. useEffect listens for changes in the singleArtist to account for change to the artists list i.e. user deletes an artist.
```js
  useEffect(() => {
    axios.get('/api/profile', {
      headers: { Authorization: `Bearer ${Auth.getToken()}` }
    })
      .then(resp => {
        setArtists(resp.data.artists)

      })
  }, [singleArtist])
```
- When the user clicks on an artist, 2 API calls are made - one to the Deezer API and another to the Skiddle API:
  - Deezer:
    - This takes the name of the clicked artist and queries the Deezer API used to display the additional artist information (top tracks, picture etc.)
  - Skiddle:
    - This also takes the name of the artist clicked and returns all of the upcoming gigs for that specific artist.
- A decision was made to display the artists gigs by location (town). This proved more difficult and required a fair amount of data wrangling. Once the gigs are returned from the API, we loop over the towns,deduplicate them (often artists will have several tour dates in the same town) and store them in a variable `cities`. We loop over `cities` and push the city into a new array as a key. Then, we loop over the original API response and push each tour date into with said location into the according key of the same location. 
```js
const data = resp.data.results
const test = resp.data.results.map((gig) => {
  return gig.venue.town
})

const cities = test.filter((a, b) => test.indexOf(a) === b)
const newData = []

for (let i = 0; i < cities.length; i++) {
  newData.push({ [cities[i]]: [] })
  for (let j = 0; j < data.length; j++) {
    if (cities[i] === data[j].venue.town) {
      newData[i][cities[i]].push(data[j])
    }
  }
}
```
## Screenshots
