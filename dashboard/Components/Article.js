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
        <Exam />
        <AlertBox />
        <PageNavigation />
        <URLViewer />
    </div>
}