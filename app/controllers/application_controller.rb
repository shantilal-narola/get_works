class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_action :configure_permitted_parameters, if: :devise_controller?

  #handle all routing errors
  rescue_from ActionController::RoutingError, :with => :render_404



  def after_sign_in_path_for(resource)
	  if user_signed_in? 
      if current_user.is_admin?
        puts "-------hi test"
        admin_dashboard_index_path
      else
        home_index_path
      end
	  else
		  root_path
   	end
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name,:last_name,:sky_id,:contact_num,:type])
  end

  private

  def render_404(exception = nil)
    if exception
        logger.info "Rendering 404: #{exception.message}"
    end
    render :file => "#{Rails.root}/public/404.html", :status => 404, :layout => false
  end

end
