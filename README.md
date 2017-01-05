Install node, phantomjs and casperjs

Clone the repo inside ~/jira

Run casperjs scraper.js

Add to your bashrc file:

source ~/.bash-preexec.sh

preexec() {
  if [ $1 = "git status" ]
    then
      branch=$(git rev-parse --abbrev-ref HEAD)
      if [ -e ~/jira/tasks/$branch ]
        then
          echo "===== Current Jira task ====="
          cat ~/jira/tasks/$branch
          echo "\n========================================================================="
      fi
  fi
}
