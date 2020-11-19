class Widget extends React.Component {
    render() {
        return <WidgetContainer />
  
    }
}

function WidgetContainer() {
    return <div id="widget-container">
        <ToolBox />
        <ToolBoxHelp />
        <Exam />
        <AlertBox />
        <PageNavigation />
        <URLViewer />
        <Canvas />
    </div>
}
