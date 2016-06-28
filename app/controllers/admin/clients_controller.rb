class Admin::ClientsController < Admin::BaseController
	before_action :set_client , only: [:show,:edit, :destroy , :update ]

	def index
		@admin_clients = Client.all
	end 

	def new
		@admin_client = Client.new
	end

	def create
		@admin_client = Client.new(admin_client_params)
		if @admin_client.save
			redirect_to admin_clients_path,:notice => "Client is succefully created."
		else
			flash[:errors] = @admin_client.errors.full_messages
			render :new 
		end
	end 

	def show

	end

	def edit
		
	end

	def update 
		if @admin_client.update_attributes(admin_client_params)
			redirect_to admin_client_path , :notice => "Client is succefully updated."
		else
			render :edit
		end
		
	end 

	def destroy
		if @admin_client.destroy
			redirect_to admin_clients_path , :notice => "Client is succefully destroy."
		end
	end 

	private
	def set_client
		@admin_client = Client.find(params[:id])
	end 

	def admin_client_params
		params.require(:client).permit(:first_name , :last_name , :email , :contact_num , :sky_id , :password , :password_confirmation,:type,:avatar)
	end

	
end