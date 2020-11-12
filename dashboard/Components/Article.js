class Article extends React.Component {
    render() {
        return <article id="article">
            <WidgetContainer />
            <Authorization />
        </article>
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
        <MarkerContainer />
        <PencilContainer />
        <TextInputContainer />
    </div>
}
