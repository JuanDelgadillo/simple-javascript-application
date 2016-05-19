  var myApp = myApp || {}

  myApp.usersModule = (function () {

    var handleRoutesEvents = function (initialRoute) {
      return function () {
        var route = window.location.hash.split('#')[1]
        var userList = document.querySelector('#userList')
        var userDetails = document.querySelector('#userDetails')

        if (route === '/users') {
          userDetails.style.display = 'none'
          userList.style.display = 'block'
          var start = !globalUsers.length
          renderUsers(start)
        } else if (/^\/user\/([0-9]{1,4})\/details$/.test(route)) {
          userList.style.display = 'none'
          userDetails.style.display = 'block'
          var user = parseInt(route.split('/')[2])
          renderUserDetails(user)
        } else {
          setRoute(initialRoute)
        }
      }
    }

    var bootstrap = function () {
      globalUsers = []
      initialRoute = '#/users'
      var addUserButton = document.querySelector('#addUser')
      var resetUsersButton = document.querySelector('#resetUsers')
      var returnButton = document.querySelector('#return')
      window.onhashchange = handleRoutesEvents(initialRoute)

      setRoute(initialRoute, true)

      addUserButton.addEventListener('click', function () {
        var username = document.querySelector('#username')
        var user = { 
          name: username.value
        }
        if (user.name) {
          addNewUser(user)
        } else {
          alert('You must enter your name.')
        }
      })

      resetUsersButton.addEventListener('click', function () {
        var start = true
        renderUsers(start)
      })

      returnButton.addEventListener('click', function () {
        setRoute(initialRoute)
      })
    }

    var setRoute = function (route, start) {
      if (start) {
        handleRoutesEvents(route)()
      } else {        
        var route = window.location.pathname + route
        window.location.href = route
      }
    }

    var ajax = function (url, callback) {
      if(window.XMLHttpRequest)
            httpRequest = new XMLHttpRequest();
        else if(window.ActiveXObject)
            httpRequest = new ActiveXObject("Microsoft.XMLHTTP");

      httpRequest.onreadystatechange = function()
        {
            if(httpRequest.readyState == 4)
            {
                if(httpRequest.status == 200)
                {
                  var response = JSON.parse(httpRequest.responseText)
                  callback(response)
                }
            }
        }

      httpRequest.open("GET", url, true);
      httpRequest.send();
    }

    var userService = function (callback) {
      var usersUrl = 'http://jsonplaceholder.typicode.com/users'
      ajax(usersUrl, function (users) {
        callback(users)
      })
    }

    var postsService = function (callback) {
      postsUrl = 'http://jsonplaceholder.typicode.com/posts'
      ajax(postsUrl, function (posts) {
        callback(posts)
      })
    }

    var usersService = function (start, callback) {
      if (start) {
        userService(function (users) {
          postsService(function (posts) {
            for (user in users) {
              users[user].amountOfPosts = 0
              users[user].posts = []
              for (post in posts) {
                if (users[user].id === posts[post].userId) {
                  users[user].amountOfPosts += 1
                  users[user].posts.push(posts[post])
                }
              }
            }
            globalUsers = users
            callback()
          })
        })
      } else {
        callback()
      }
    }

    var totalUsers = function () {
      var countUsers = document.querySelector('#countUsers')
      countUsers.innerText = globalUsers.length
    }

    var deleteUser = function (user) {
      globalUsers.splice(user, 1)
      renderUsers()
    }

    var addDeleteFunctionality = function () {
      var deleteButtons = document.querySelectorAll('.delete')

      for (var button = 0; button < deleteButtons.length; button ++) {
        deleteButtons[button].addEventListener('click', function (event) {
          var user = event.target.id
          deleteUser(user)
        })
      }
    }

    var addDetailsFunctionality = function () {
      var detailsButtons = document.querySelectorAll('.details')

      for (var button = 0; button < detailsButtons.length; button ++) {
        detailsButtons[button].addEventListener('click', function (event) {
          var user = event.target.id
          newRoute = '#/user/' + user + '/details'
          setRoute(newRoute)
        })
      }
    }

    var renderUserDetails = function (userSelected) {
      var start = !globalUsers.length
      usersService(start, function () {
        var listOfPosts = document.querySelector('#listOfPosts')
        var user = globalUsers[userSelected]

        if (user) {
          var userTitleDetail = document.querySelector('#userTitleDetail')
          userTitleDetail.innerText = user.name + ' (' + user.username + ')'
          listOfPosts.innerHTML = ''

          for (post in user.posts) {
            var postId = user.posts[post].id
            var postTitle = user.posts[post].title
            listOfPosts.insertAdjacentHTML('beforeend', '<li>' + postId + '. ' + postTitle + '</li>')
          }
        } else {
          setRoute(initialRoute)
          alert('The user does not exist.')
        }
      })
    }

    var renderUsers = function (start) {
      usersService(start, function () {
        var listOfUsers = document.querySelector('#listOfUsers')
        listOfUsers.innerHTML = ''

        for (user in globalUsers) {
          listOfUsers.insertAdjacentHTML('beforeend', '<li><span>' + globalUsers[user].name + ' - ' + '(' + globalUsers[user].amountOfPosts + ' posts)' + '</span> <div class="operations"><button class="delete" id="'+ user +'">Delete</button> <button class="details" id="'+ user +'">Details</button></div></li>')
        }

        totalUsers()
        addDeleteFunctionality()
        addDetailsFunctionality()
      })
    }

    var addNewUser = function (user) {
      var newUser = {
        name: user.name,
        username: user.name,
        amountOfPosts: 0,
        posts: []
      }

      globalUsers.push(newUser)
      renderUsers()
      username.value = ''
    }

    return {
      run: function () {
        return bootstrap()
      }
    }
  })();

myApp.run = function () {
  return myApp.usersModule.run()
}

myApp.run()
