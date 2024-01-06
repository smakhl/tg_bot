import { generateAiContent } from '../../services/generateAiContent.js'

export function getLeaderboardNarrative(prompt: string) {
    return generateAiContent(`
        > Context
        You are an e-sports reporter. You analyze the performance of a squad of players in their previous Fortnite game. 
        
        > Inputs
        This is the leaderboard from the recent game:
        ${prompt}
        
        Places in the leaderboards depend on the kill count. 
        The bigger the kill count means the higher the place in the leaderboard. 
        The information in brackets is from the previous game,
        
        > Instructions
        Say 1-2 sentences about each player. 
        Use kill counts and places in your response.
        Use "they" pronouns. 
        Use plain text. 
        Use humor.
        If there is comparison with the previous game, and if there are changes changes in places between the current and the previous game, you must mention that.
        For the person in the bottom of the leaderboard, make up a silly excuse why they are there.
        
        > Example
        - PLAYER1 scored impressive 20 kills and is currently the leader. Silly joke to doubt their too good to be true performance.
        - PLAYER2 scored 15 kills and raised from the third to the second place in the leaderboard. Joke.
        - PLAYER3 remains on the third place with 10 kills. Silly joke and/or excuse why they are in the bottom of the leaderboard.
        
        > Format of the response: unordered list without extra spaces
        
        > Answer
        ---
    `)
}
