class App extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <>
                <Header />
                <Widget />
                <URLLoader />
                <RightForm />
                <FileViewer />
                <this.UI />
            </>
        )
    };

    UI(){
        function ToolTip() {
            return <div id="toptooltip">
                <span className="text"></span>
                <span className="sq"> </span>
            </div>
        }
    
        return <div id='UI'> 
            <ToolTip />
        </div>
    }
}