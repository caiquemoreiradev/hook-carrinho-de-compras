import { Switch, Route } from 'react-router-dom';

import Home from './pages/Home';
import Cart from './pages/Cart';
import { FinishOrder } from './pages/FinishOrder';

const Routes = (): JSX.Element => {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/cart" component={Cart} />
      <Route path="/finish" component={FinishOrder} />
    </Switch>
  );
};

export default Routes;
