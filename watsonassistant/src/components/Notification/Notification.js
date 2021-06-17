import React from 'react';
import { ToastNotification } from 'carbon-components-react';
import Transition from 'react-transition-group/Transition';

const Notification = ({notification, text, duration}) => {

  const defaultStyle = {
    position: 'fixed',
    top: '3rem',
    right: '0',
    zIndex: '1000'
  };
  
  const transitionStyles = {
    entered: {
      transform: 'translateX(100%)',
      transition: `transform ${duration}ms ease-in-out`
    },
    exited: {
      transform: 'translateX(-100%)',
      transition: `transform ${duration}ms ease-in-out`,
    }
  };

  return (
    <Transition in={notification} timeout={duration} unmountOnExit>
      {(state) => (
        <div style={{
          ...defaultStyle,
          ...transitionStyles[state]
        }}>
          <ToastNotification lowContrast
            title={'Erro!'}
            kind={'error'}
            subtitle={text}
            hideCloseButton
            caption={null}
            timeout={10000}
          />
        </div>
      )}
    </Transition>
  );
}

export default Notification;