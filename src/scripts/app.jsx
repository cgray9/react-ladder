'use strict';

var $ = jQuery;
window.React = require('react/addons');
var Reflux   = require('reflux');

var attachFastClick = require('fastclick');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Navigation = Router.Navigation;

var userStore = require('./stores/userStore');
var actions = require('./actions/actions');
var Login = require('./components/login');
var Register = require('./components/register');

var ReactLadder = React.createClass({
    mixins: [
        Navigation,
        Reflux.listenTo(userStore, 'onStoreUpdate'),
        Reflux.listenTo(actions.showOverlay, 'showOverlay')
    ],

    getInitialState: function() {
        return {
            user: {
                uid: '',
                profile: {
                    username: '',
                    upvoted: {}
                },
                isLoggedIn: false
            },
            showOverlay: false,
            overlayType: 'login'
        };
    },

    onStoreUpdate: function(user) {
        this.setState({
            user: user,
            showOverlay: false
        });
    },

    isChildNodeOf: function(target, parentIds) {
        // returns boolean whether target is child of a list of ids
        // parentIds can be a string or an array of ids
        if (typeof parentIds === 'string') {
            parentIds = [parentIds];
        }
        // if this node is not the one we want, move up the dom tree
        while (target !== null && parentIds.indexOf(target.id) < 0) {
            target = target.parentNode;
        }
        // at this point we have found our containing div or we are out of parent nodes
        return (target !== null && parentIds.indexOf(target.id) >= 0);
    },

    componentDidMount: function() {
        $(document).keyup(function(e) {
            if (e.keyCode === 27) { // esc
                e.preventDefault();
                this.hideOverlay();
            }
        }.bind(this));
    },

    showOverlay: function(type) {
        var overlay = this.refs.overlay.getDOMNode();
        overlay.addEventListener('click', this.hideOverlayListener);
        this.setState({
            overlayType: type,
            showOverlay: true
        });
    },

    hideOverlayListener: function(e) {
        if (!this.isChildNodeOf(e.target, ['overlay-content'])) {
            this.hideOverlay();
        }
    },

    hideOverlay: function() {
        this.setState({
            showOverlay: false
        });
    },

    logout: function(e) {
        e.preventDefault();
        actions.logout();
        this.transitionTo('home');
    },

    render: function() {
        var cx = React.addons.classSet;
        var user = this.state.user;

        var username = user ? user.profile.username : '';
        var md5hash = user ? user.profile.md5hash : '';
        var gravatarURI = 'http://www.gravatar.com/avatar/' + md5hash + '?d=mm';

        var overlayCx = cx({
            'modal-overlay': true,
            'modal-show': this.state.showOverlay
        });
 
        var overlayContent = <Login />;
        if (this.state.overlayType === 'register') {
            overlayContent = <Register />;
        }

        var userArea;
        if (user.isLoggedIn) {
            // show profile info
            userArea = (
                <span className="user-info">
                    <div className="profile-link">
                        <img src={ gravatarURI } className="nav-pic" />
                        <span className="username">{ username }</span>
                        <a onClick={ this.logout }>Logout</a>
                    </div>
                </span>
            );
        } else {
            // show login/register
            userArea = (
                <span className="user-info">
                    <a onClick={ actions.showOverlay.bind(this, 'login') }>Sign In</a>
                    <a onClick={ actions.showOverlay.bind(this, 'register') } className="register-link">Register</a>
                </span>
            );
        }

        return (
            <div className="main-app">
                <header className="header">
                    <a className="menu-title">ReactLadder</a>
                        { userArea }
                </header>
                <main id="content">
                    <RouteHandler { ...this.props } user={ this.state.user } />
                </main>
                <div className={ overlayCx } ref="overlay">{ overlayContent }</div>
            </div>
        );
    }
});
var routes = (
    <Route handler={ ReactLadder }>
    </Route>
)

Router.run(routes, function(Handler, state) {
    React.render(<Handler params={ state.params } />, document.getElementById('app'));
});

// fastclick eliminates 300ms click delay on mobile
attachFastClick(document.body);