'use strict';

var Reflux = require('reflux');

// actions
var actions = require('../actions/actions');

// stores
var loginStore = require('../stores/loginStore');
var userStore = require('../stores/userStore');

var Register = React.createClass({

    mixins: [
        Reflux.listenTo(userStore, 'resetForm'),
        Reflux.listenTo(loginStore, 'onErrorMessage')
    ],

    getInitialState: function() {
        return {
            error: '',
            submitted: false
        };
    },

    resetForm: function() {
        this.setState({
            submitted: false,
        });
        this.refs.username.getDOMNode().value = '';
        this.refs.email.getDOMNode().value = '';
        this.refs.password.getDOMNode().value = '';
        this.refs.submit.getDOMNode().disabled = false;
    },

    onErrorMessage: function(errorMessage) {
        this.refs.submit.getDOMNode().disabled = false;
        this.setState({
            error: errorMessage,
            submitted: false
        });
    },

    registerUser: function(e) {
        e.preventDefault();

        this.refs.submit.getDOMNode().disabled = true;
        this.setState({
            submitted: true
        });

        var loginData = {
            email: this.refs.email.getDOMNode().value.trim(),
            password: this.refs.password.getDOMNode().value.trim()
        };

        var userData = {
            username: this.refs.username.getDOMNode().value.trim(),
            name: this.refs.name.getDOMNode().value.trim()
        }
        actions.register(userData, loginData);
    },

    render: function() {
        var error = this.state.error ? <div className="error login-error">{ this.state.error }</div> : '';

        return (
            <div className="login modal text-center" id="overlay-content">
                { error }
                <form onSubmit={ this.registerUser } className="login-form text-left">
                    <h1>Register</h1>
                    <label htmlFor="username">Name</label><br />
                    <input type="text" placeholder="Name" id="name" ref="name" /><br />
                    <label htmlFor="username">Username</label><br />
                    <input type="text" placeholder="Username" id="username" ref="username" /><br />
                    <label htmlFor="email">Email</label><br />
                    <input type="email" placeholder="Email" id="email" ref="email" /><br />
                    <label htmlFor="password">Password</label><br />
                    <input type="password" placeholder="Password" id="password" ref="password" /><br />
                    <button type="submit" className="button button-primary" ref="submit">
                        { this.state.submitted ? 'Loading' : 'Register' }
                    </button>
                </form>
            </div>
        );
    }

});

module.exports = Register;