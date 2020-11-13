class _3DRender extends React.Component {
    constructor(props){
        super(props);

        this.state = {
        }
    }

    render(){
        return <></>
    }

    set3DModelStateData(_newPosition, _newRotation){
        this.state.newPosition = _newPosition;
        this.state.newRotation = _newRotation;
    }
}