

class DeviceSetting extends React.Component {
    constructor(props){
        super(props);
        this.state ={
            mic : [],
            cam : [],
        }
    }

    componentDidMount(){
        let mic = [];
        let cam = [];

        navigator.mediaDevices.enumerateDevices().then(e => {
            e.forEach(device => {
                // console.log(device);
                if(device.kind == 'audioinput'){
                    // console.log('mic', device)
                    mic.push(device);
                }
                else if(device.kind == 'videoinput'){
                    // console.log('cam', device)
                    cam.push(device);
                }
            })
            this.setState({
                mic,cam
            })
        });
    }

    render(){
        return <div style={{position : 'absolute'}}></div>
    }
}