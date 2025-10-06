# KaXing

_We have Kahoot at home_

<img src="https://michaelxing.com/projects/img/kaxing-question.png" alt="A screenshot from the game" style="max-width: 500px;">

A real-time quiz game where questions are displayed on a screen and players answer on their phones.

Works just like that other quiz game, except free and open source and not owned by private equity.

Includes many core features, such as:
- Multiple choice questions
- True / false questions
- Short answer questions
- Image support
- Static, non-question slides

Also includes a bunch of features I wanted, including:
- Remotely control the game from your phone
- A map / geo-guesser style question type
- Custom regex matching on short answer questions
- Advanced timing controls, pausing on the question intro for as long as needed
- Option to show answer choices without accepting responses
- Ability to jump around questions
- Custom game joining questions (eg: student ID)
- Dual screen mode with image-only display on second screen
- Customizable music

## Play

Create your own or play a game at [https://michaelxing.com/kaxing](https://michaelxing.com/kaxing)

My site hosts no user content. All games are saved as a proprietary `.kaxing` file (totally not a renamed JSON) to your local machine.

### Custom Music

To specify custom music at runtime, your music files must be hosted on a publicly accessible web server. You must also host a JSON file with the following format:

```
{
  "theme": "<theme song>",
  "end": "<time's up sound effect>",
  "gg": "<podium song>",
  "q": {
    "10": [
      "<list of>",
      "<10 sec>",
      "<countdown>",
      "<songs>"
    ],
    "20": [
      "<etc>"
    ],
    "30": [
      "<etc>"
    ],
    "60": [
      "<etc>"
    ],
    "90": [
      "<etc>"
    ]
  }
}
```

Here, each value is the URL of the associated music or sound effect. This JSON must be hosted at a location whose CORS headers allow reading from `michaelxing.com`. Then, on the game board page, pass the URL of the JSON as a query parameter to load the music.

## Develop

The main game itself is written in TypeScript with no UI libraries or frameworks. From the root directory, run `npm ci` to install dependencies and then `npm start` to start a dev server. The client will run on `localhost:3000`. Note that the dev server does not hot-reload for server-side changes.

Run `npm run server-build` and `npm run client-build` to build the output bundles for the server and client, respectively.

The equation editor is a separate project, inside the `client/editor` directory. This is a React app running on Vue, requiring a separate `npm ci` from inside the folder to install dependencies. Then, `npm run dev` to start the dev server. `npm run build` builds the final editor.
