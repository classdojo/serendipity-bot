# Serendipity Bot

## What is it?
Serendipity Bot randomly pairs people for 1-1 meetings. This is generally pleasant and productive in organizations larger than a handleful of people, and can be a great way to spread ideas and build relationships between team members.

## How do I use it?
### Install it
`npm i --g serendipity-bot`

### Make a list of names
Save something like this to a file
```md
Peter
Paul
Mary
John
George
Ringo
Keith
Mick
```
*Note: if you're using Slack, you may want these to be Slack handles or emoji.*

### Run the script
####To log today's pairing:
`serendipity-bot [list_of_names]`

####To post to Slack:
You'll first need to get a token for your Slack account.  
`serendipity-bot [list_of_names] --token [slack token] --channel [slack channel]`

### To learn more
`serendipity-bot --help`

## What then?
Set up a cron job to run the script regularly! Our engineering team at ClassDojo runs the bot every Wednesday and Friday.

## How does it work?
The script calculates all 2-combinations of team members and shuffles them deterministically. It also stores an integer index value in a file.

Whenever the script is run, the index is incremented (mod the number of combinations), and we pick the combination at that index. This way, we cycle through every pairing before repeating.


