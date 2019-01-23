import React from 'react';
import EditableTimerList from './EditableTimerList'
import ToggleableTimerForm from './ToggleableTimerForm'

class TimersDashboard extends React.Component {
  state = {
    timers: [],
  };
  
  componentDidMount() {
    this.loadTimersFromServer();
    setInterval(this.loadTimersFromServer, 5000);
  }
  
  loadTimersFromServer = () => {
    this.getTimers((serverTimers) => (
      this.setState({ timers: serverTimers })
      )
    )
  }
  
  getTimers = (success) => {
    return fetch('http://localhost:5000/api/timers', {
      headers: {
        Accept: 'application/json',
      },
    }).then(this.checkStatus)
      .then(this.parseJSON)
      .then(success);
  }
  
  checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
      console.log(response)
      return response;
    } else {
      const error = new Error(`HTTP Error ${response.statusText}`);
      error.status = response.statusText;
      error.response = response;
      console.log(error);
      throw error;
    }
  }
  
  parseJSON = (response) => {
    return response.json();
  }
  
  newTimer = (attrs = {}) => {
    const timer = {
      title: attrs.title || 'Timer',
      project: attrs.project || 'Project',
      id: uuid.v4(), // eslint-disable-line no-undef
      elapsed: 0,
    };

    return timer;
  }
  
  handleCreateFormSubmit = (timer) => {
    this.createTimer(timer);
  };
  
  handleEditFormSubmit = (attrs) => {
    this.updateTimer(attrs);
  }
  
  createTimer = (timer) => {
    const t = this.newTimer(timer);
    this.setState({
      timers: this.state.timers.concat(t),
    });
    
    this.createTimerData(t);
  };
  
  createTimerData = (data) => {
    return fetch('/api/timers', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(this.checkStatus);
  }
  
  updateTimer = (attrs) => {
    this.setState({
      timers: this.state.timers.map((timer) => {
        if(timer.id === attrs.id){
          return Object.assign({}, timer, {
            title: attrs.title,
            project: attrs.project,
          });
        } else {
          return timer;
        }
      }),
    });
    this.updateTimerData(attrs)
  };
  
  updateTimerData = (data) => {
    return fetch('/api/timers', {
      method: 'put',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(this.checkStatus);
  }
  
  handleTrashClick = (timerId) => {
    this.deleteTimer(timerId);
  };
  
  handleStartClick = (timerId) => {
    this.startTimer(timerId);
  };
  
  handleStopClick = (timerId) => {
    this.stopTimer(timerId);
  };
  
  deleteTimer = (timerId) => {
      this.setState({
        timers: this.state.timers.filter(t => t.id !== timerId),
      });
      this.deleteTimerData({
        id: timerId
      });
  };
  
  deleteTimerData = (data) => {
    return fetch('/api/timers', {
      method: 'delete',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(this.checkStatus);
  }
  
  startTimer = (timerId) => {
    const now = Date.now();
    
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === timerId) {
          return Object.assign({}, timer, {
            runningSince: now,
          });
        } else {
          return timer;
        }
      }),
    });
    this.startTimerData(
      { id: timerId, start: now }
    );
  };
  
  startTimerData = (data) => {
    return fetch('/api/timers/start', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(this.checkStatus);
  }

  stopTimer = (timerId) => {
    const now = Date.now();
    
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === timerId) {
          const lastElapsed = now - timer.runningSince;
          return Object.assign({}, timer, {
            elapsed: timer.elapsed + lastElapsed,
            runningSince: null,
          });
        } else {
          return timer;
        }
      }),
    });
    this.stopTimerData(
      { id: timerId, stop: now }
    );
  };
  
  stopTimerData = (data) => {
    return fetch('/api/timers/stop', {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(this.checkStatus);
  }
  
  
  render() {
    return (
      <div className='ui three column centered grid'>
        <div className='column'>
          <EditableTimerList
            timers={this.state.timers}
            onFormSubmit={this.handleEditFormSubmit}
            onTrashClick={this.handleTrashClick}
            onStartClick={this.handleStartClick}
            onStopClick={this.handleStopClick}
          />
          <ToggleableTimerForm
            onFormSubmit={this.handleCreateFormSubmit}
          />
        </div>
      </div>
    );
  }
}

export default TimersDashboard;
