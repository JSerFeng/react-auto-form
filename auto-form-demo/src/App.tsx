import View from './components/view'
import "./App.css"
import Widgets from './components/widgets';
import Operators from './components/operators';

function App() {
  return <div>
    <div className="flex jb" style={ { height: "100vh" } }>
      <Widgets />
      <View />
      <Operators />
    </div>
  </div>
}

export default App
