
// @GENERATOR:play-routes-compiler
// @SOURCE:/Users/sallyp/Downloads/codes/Visier/ubc2016may/conf/routes
// @DATE:Tue May 10 22:23:27 PDT 2016


package router {
  object RoutesPrefix {
    private var _prefix: String = "/"
    def setPrefix(p: String): Unit = {
      _prefix = p
    }
    def prefix: String = _prefix
    val byNamePrefix: Function0[String] = { () => prefix }
  }
}
